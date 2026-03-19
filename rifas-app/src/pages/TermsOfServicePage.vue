<template>
  <q-page class="q-pa-md">
    <div class="max-width-container q-mx-auto">
      <q-toolbar class="q-px-none q-mb-lg">
        <q-btn flat dense round icon="arrow_back" @click="navigateBack" />
        <q-toolbar-title class="text-h5"> Condiciones de Servicio </q-toolbar-title>
      </q-toolbar>

      <div class="terms-content">
        <p class="text-subtitle2 text-grey-7 q-mb-lg">Última actualización: {{ lastUpdated }}</p>

        <q-timeline color="primary" layout="dense" class="q-mt-lg">
          <q-timeline-entry title="Introducción" subtitle="Aceptación de términos" icon="handshake">
            <p>
              Al acceder y utilizar la aplicación "Gestión de Rifas", aceptas estar obligado por
              estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos,
              no debes usar la aplicación. Nos reservamos el derecho de cambiar estos términos en
              cualquier momento.
            </p>
          </q-timeline-entry>

          <q-timeline-entry title="1. Definiciones" subtitle="Términos clave" icon="description">
            <ul>
              <li>
                <strong>"Aplicación":</strong> La plataforma Gestión de Rifas y todos sus servicios
                relacionados
              </li>
              <li><strong>"Usuario":</strong> Cualquier persona que acceda y use la Aplicación</li>
              <li>
                <strong>"Rifa":</strong> Un sorteo o concurso organizado mediante la Aplicación
              </li>
              <li>
                <strong>"Contenido":</strong> Toda información, datos, textos, imágenes subidas por
                usuarios
              </li>
              <li><strong>"Nosotros/Empresa":</strong> Los operadores de la Aplicación</li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry
            title="2. Licencia de Uso"
            subtitle="Derechos otorgados"
            icon="card_giftcard"
          >
            <p>
              Te otorgamos una licencia personal, no exclusiva, revocable e intransferible para
              acceder y usar la Aplicación, sujeto a estos Términos. Está prohibido:
            </p>
            <ul>
              <li>Reproducir, duplicar o copiar la Aplicación</li>
              <li>Vender, revender o explotar la Aplicación</li>
              <li>Modificar, decodificar, descompilar o realizar ingeniería inversa</li>
              <li>Usar bots, scrapers u otras herramientas automatizadas</li>
              <li>Intentar ganar acceso no autorizado a sistemas</li>
              <li>Interferir con el funcionamiento normal de la Aplicación</li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry
            title="3. Cuentas de Usuario"
            subtitle="Responsabilidad de tu cuenta"
            icon="account_circle"
          >
            <p>
              Eres responsable de mantener la confidencialidad de tu contraseña y de todas las
              actividades realizadas en tu cuenta. Debes:
            </p>
            <ul>
              <li>Proporcionar información precisa, actual y completa al registrarte</li>
              <li>Notificarnos inmediatamente de acceso no autorizado</li>
              <li>Asumir toda responsabilidad por actividades bajo tu cuenta</li>
              <li>Mantener una contraseña segura y cambiarla regularmente</li>
            </ul>
            <p class="q-mt-md">
              Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos.
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="4. Contenido del Usuario"
            subtitle="Tus derechos y responsabilidades"
            icon="edit"
          >
            <p>
              Al cargar contenido a la Aplicación, retienes la propiedad, pero nos otorgas una
              licencia para usarlo. Garantizas que:
            </p>
            <ul>
              <li>Tienes derechos sobre el contenido que cargas</li>
              <li>El contenido no infringe derechos de propiedad intelectual</li>
              <li>El contenido no es difamatorio, abusivo o ilegal</li>
              <li>No contiene virus, malware u código malicioso</li>
            </ul>
            <p class="q-mt-md">
              Nos reservamos el derecho de eliminar contenido que viole estos términos.
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="5. Conducta del Usuario"
            subtitle="Comportamiento prohibido"
            icon="block"
          >
            <p>No debes:</p>
            <ul>
              <li>Usar la Aplicación para actividades ilegales</li>
              <li>Acosar, intimidar o amenazar a otros usuarios</li>
              <li>Publicar contenido discriminatorio u ofensivo</li>
              <li>Cometer fraude o actividades deceptivas</li>
              <li>Violar la privacidad de otros usuarios</li>
              <li>Intentar obtener datos de otros usuarios sin consentimiento</li>
              <li>Participar en lavado de dinero o financiamiento del terrorismo</li>
              <li>Usar la Aplicación para vender bienes o servicios ilegales</li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry
            title="6. Propiedad Intelectual"
            subtitle="Nuestros derechos"
            icon="copyright"
          >
            <p>
              La Aplicación, incluyendo su código, diseño, gráficos, características y contenido, es
              propiedad nuestra o de nuestros licenciantes. Estos están protegidos por leyes de
              propiedad intelectual. No puedes:
            </p>
            <ul>
              <li>Usar nuestras marcas registradas sin consentimiento</li>
              <li>Copiar o reproducir nuestro contenido protegido</li>
              <li>Crear trabajos derivados sin autorización</li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry
            title="7. Limitación de Responsabilidad"
            subtitle="Lo que no garantizamos"
            icon="warning"
          >
            <p class="text-weight-bold q-mb-md">
              LA APLICACIÓN SE PROPORCIONA "TAL CUAL" SIN GARANTÍAS DE NINGÚN TIPO.
            </p>
            <p>En la máxima medida permitida por la ley, no seremos responsables por:</p>
            <ul>
              <li>Pérdida de datos o información</li>
              <li>Pérdida de ganancias o ingresos</li>
              <li>Daños indirectos, incidentales o consecuentes</li>
              <li>Interrupción del servicio</li>
              <li>Errores o inexactitudes en la Aplicación</li>
            </ul>
            <p class="q-mt-md">
              Nuestra responsabilidad total no excederá la cantidad que pagaste por el servicio en
              los últimos 12 meses.
            </p>
          </q-timeline-entry>

          <q-timeline-entry title="8. Indemnización" subtitle="Tu defensa legal" icon="security">
            <p>
              Aceptas indemnizar y mantener indemne a la Empresa de cualquier reclamación, daño o
              gasto (incluyendo honorarios legales) derivados de:
            </p>
            <ul>
              <li>Tu violación de estos Términos</li>
              <li>Tu uso inapropiado de la Aplicación</li>
              <li>Tu contenido cargado a la Aplicación</li>
              <li>Violación de derechos de terceros</li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry title="9. Termination" subtitle="Fin del servicio" icon="logout">
            <p>
              Puedes dejar de usar la Aplicación en cualquier momento. Podemos terminar tu acceso
              si:
            </p>
            <ul>
              <li>Violas estos Términos</li>
              <li>Participas en actividades ilegales</li>
              <li>Realizas acciones dañinas para la Aplicación</li>
              <li>Por razones comerciales o técnicas</li>
            </ul>
            <p class="q-mt-md">La terminación no afectará tus obligaciones bajo estos Términos.</p>
          </q-timeline-entry>

          <q-timeline-entry
            title="10. Modificaciones del Servicio"
            subtitle="Cambios en la Aplicación"
            icon="update"
          >
            <p>
              Podemos modificar, suspender o discontinuar la Aplicación o cualquier parte de ella en
              cualquier momento, con o sin aviso. No seremos responsables por interrupciones del
              servicio.
            </p>
          </q-timeline-entry>

          <q-timeline-entry title="11. Ley Aplicable" subtitle="Jurisdicción" icon="gavel">
            <p>
              Estos Términos se rigen por las leyes de España, sin considerar sus disposiciones
              sobre conflictos de ley. Cualquier disputa se resolverá en los tribunales competentes
              de España.
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="12. Disposiciones Generales"
            subtitle="Cláusulas finales"
            icon="list"
          >
            <ul>
              <li>
                <strong>Integración:</strong> Estos Términos constituyen el acuerdo completo entre
                nosotros
              </li>
              <li>
                <strong>Divisibilidad:</strong> Si alguna cláusula es inválida, las demás permanecen
                vigentes
              </li>
              <li><strong>Cesión:</strong> No puedes ceder tus derechos bajo estos Términos</li>
              <li><strong>Renuncia:</strong> No renunciamos a derechos por no hacerlos cumplir</li>
              <li><strong>Avisos:</strong> Los avisos legales se harán por correo electrónico</li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry title="13. Contacto" subtitle="Preguntas sobre términos" icon="mail">
            <p>Si tienes preguntas sobre estos Términos de Servicio, por favor contáctanos:</p>
            <div class="q-mt-md">
              <p class="q-mb-sm"><strong>Email:</strong> {{ appConfig.contactEmail }}</p>
              <p class="q-mb-sm"><strong>Dirección:</strong> {{ appConfig.contactAddress }}</p>
            </div>
          </q-timeline-entry>
        </q-timeline>

        <q-separator class="q-my-lg" />

        <div class="text-center q-mt-xl">
          <q-btn
            unelevated
            color="primary"
            label="Volver al Inicio"
            icon="home"
            @click="navigateHome"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
import { appConfig } from '../config';

const router = useRouter();

/**
 * Calcula la fecha de última actualización.
 */
const lastUpdated = computed(() => {
  return dayjs('2025-12-22').locale('es').format('DD [de] MMMM [de] YYYY');
});

/**
 * Navega atrás en el historial del navegador.
 */
function navigateBack() {
  router.back();
}

/**
 * Navega al inicio de la aplicación.
 */
function navigateHome() {
  void router.push({ name: 'rifas' });
}
</script>

<style scoped lang="scss">
.max-width-container {
  max-width: 900px;
}

.terms-content {
  line-height: 1.8;

  p {
    margin-bottom: 1rem;
    color: #333;
  }

  ul {
    padding-left: 1.5rem;
    margin: 1rem 0;

    li {
      margin-bottom: 0.5rem;
    }
  }
}
</style>
