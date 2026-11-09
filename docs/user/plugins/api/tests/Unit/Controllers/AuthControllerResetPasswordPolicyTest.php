<?php

declare(strict_types=1);

namespace Grav\Plugin\Api\Tests\Unit\Controllers;

use Grav\Common\Config\Config;
use Grav\Common\User\Interfaces\UserInterface;
use Grav\Plugin\Api\Controllers\AuthController;
use Grav\Plugin\Api\Exceptions\ValidationException;
use Grav\Plugin\Api\Tests\Unit\TestHelper;
use PHPUnit\Framework\Attributes\CoversClass;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

/**
 * POST /auth/reset-password applies the same password policy as setup and
 * invite-accept. It used to accept any password, even a single character.
 */
#[CoversClass(AuthController::class)]
class AuthControllerResetPasswordPolicyTest extends TestCase
{
    private const TOKEN = 'goodtoken';

    private function controller(UserInterface $user, string $regex): AuthController
    {
        $config = new Config([
            'system' => ['pwd_regex' => $regex],
            'plugins' => ['api' => ['route' => '/api', 'version_prefix' => 'v1']],
        ]);

        $grav = TestHelper::createMockGrav([
            'config'   => $config,
            'accounts' => TestHelper::createMockAccounts([$user->username => $user]),
        ]);

        return new AuthController($grav, $config);
    }

    private function resetUser(): UserInterface
    {
        return TestHelper::createMockUser('jane', [
            'reset' => self::TOKEN . '::' . (time() + 3600),
            'hashed_password' => 'old-hash',
        ]);
    }

    private function reset(AuthController $c, string $token, string $password): void
    {
        $body = ['username' => 'jane', 'token' => $token, 'password' => $password];
        $c->resetPassword(TestHelper::createMockRequest(
            method: 'POST',
            path: '/api/v1/auth/reset-password',
            headers: ['Content-Type' => 'application/json'],
            body: json_encode($body),
            attributes: ['json_body' => $body],
        ));
    }

    #[Test]
    public function short_password_is_rejected_when_no_regex_is_set(): void
    {
        $user = $this->resetUser();
        $c = $this->controller($user, '');

        try {
            $this->reset($c, self::TOKEN, 'x');
            $this->fail('A one-character password should be refused.');
        } catch (ValidationException $e) {
            $this->assertSame('password', $e->getValidationErrors()[0]['field'] ?? null);
        }

        // Nothing was changed, so the link can be used again.
        $this->assertSame('old-hash', $user->get('hashed_password'));
        $this->assertNotNull($user->get('reset'));
    }

    #[Test]
    public function password_failing_the_configured_regex_is_rejected(): void
    {
        $c = $this->controller($this->resetUser(), '(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}');

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Password does not meet the required policy.');
        $this->reset($c, self::TOKEN, 'alllowercase');
    }

    #[Test]
    public function a_bad_token_still_gets_the_vague_link_error(): void
    {
        // The policy check runs only after the link is proven valid, so a
        // weak password with a wrong token reveals nothing new.
        $c = $this->controller($this->resetUser(), '');

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('Invalid or expired reset link.');
        $this->reset($c, 'wrong', 'x');
    }
}
