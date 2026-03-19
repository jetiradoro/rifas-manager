<template>
  <q-page class="q-pa-md">
    <div class="max-width-container q-mx-auto">
      <q-toolbar class="q-px-none q-mb-lg">
        <q-btn flat dense round icon="arrow_back" @click="navigateBack" />
        <q-toolbar-title class="text-h5"> Política de Privacidad </q-toolbar-title>
      </q-toolbar>

      <div class="policy-content">
        <p class="text-subtitle2 text-grey-7 q-mb-lg">Última actualización: {{ lastUpdated }}</p>

        <q-timeline color="primary" layout="dense" class="q-mt-lg">
          <q-timeline-entry
            title="Introducción"
            subtitle="Compromiso con tu privacidad"
            icon="lock"
          >
            <p>
              En Gestión de Rifas, nos comprometemos a proteger tu privacidad y a ser transparentes
              sobre cómo manejamos tus datos personales. Esta Política de Privacidad explica qué
              información recopilamos, cómo la utilizamos y tus derechos al respecto.
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="1. Información que Recopilamos"
            subtitle="Tipos de datos personales"
            icon="info"
          >
            <p>Recopilamos la siguiente información:</p>
            <ul>
              <li>
                <strong>Información de Cuenta:</strong> Nombre, correo electrónico, contraseña
                (encriptada), teléfono
              </li>
              <li>
                <strong>Datos de Rifas:</strong> Información sobre rifas que creas o en las que
                participes
              </li>
              <li>
                <strong>Información de Transacciones:</strong> Registros de participación en rifas
              </li>
              <li>
                <strong>Datos de Uso:</strong> Información sobre cómo usas nuestra aplicación
                (navegación, clics, fechas/horas)
              </li>
              <li>
                <strong>Información Técnica:</strong> Dirección IP, tipo de navegador, dispositivo,
                sistema operativo
              </li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry
            title="2. Cómo Utilizamos tu Información"
            subtitle="Propósitos del tratamiento"
            icon="build"
          >
            <p>Utilizamos tu información para:</p>
            <ul>
              <li>Proporcionar, mantener y mejorar nuestros servicios</li>
              <li>Procesar y gestionar rifas</li>
              <li>Enviar notificaciones sobre rifas y tu cuenta</li>
              <li>Personalizar tu experiencia</li>
              <li>Detectar y prevenir fraude y actividades ilícitas</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Analizar tendencias y mejorar la experiencia del usuario</li>
              <li>Responder a tus consultas y solicitudes de soporte</li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry
            title="3. Cómo Compartimos tu Información"
            subtitle="Terceros y divulgación"
            icon="share"
          >
            <p>
              No vendemos, alquilamos ni compartimos tu información personal con terceros para fines
              de marketing. Sin embargo, podemos compartir información en estos casos:
            </p>
            <ul>
              <li><strong>Con tu consentimiento:</strong> Cuando nos autorizas explícitamente</li>
              <li>
                <strong>Proveedores de Servicios:</strong> Empresas que nos ayudan a operar
                (almacenamiento en la nube, análisis)
              </li>
              <li>
                <strong>Cumplimiento Legal:</strong> Si lo requiere la ley o una autoridad
                competente
              </li>
              <li>
                <strong>Protección de Derechos:</strong> Para proteger nuestros derechos, privacidad
                y seguridad
              </li>
            </ul>
          </q-timeline-entry>

          <q-timeline-entry
            title="4. Seguridad de Datos"
            subtitle="Protección de tu información"
            icon="security"
          >
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger
              tu información personal contra acceso no autorizado, alteración, divulgación o
              destrucción. Esto incluye:
            </p>
            <ul>
              <li>Encriptación de datos en tránsito (HTTPS/SSL)</li>
              <li>Encriptación de contraseñas</li>
              <li>Control de acceso basado en roles</li>
              <li>Auditorías de seguridad regulares</li>
              <li>Copias de seguridad automáticas</li>
            </ul>
            <p class="q-mt-md text-italic text-grey-7">
              Sin embargo, ningún método de transmisión es 100% seguro. Mientras hacemos esfuerzos
              para proteger tu información, no podemos garantizar seguridad absoluta.
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="5. Retención de Datos"
            subtitle="Período de almacenamiento"
            icon="schedule"
          >
            <p>
              Retenemos tu información personal mientras tu cuenta esté activa. Después de eliminar
              tu cuenta, retenemos datos en copias de seguridad durante 90 días. Algunos datos
              pueden retenerse más tiempo si es requerido por ley.
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="6. Tus Derechos"
            subtitle="Control sobre tu información"
            icon="gavel"
          >
            <p>Tienes derecho a:</p>
            <ul>
              <li><strong>Acceder:</strong> Solicitar una copia de tus datos</li>
              <li><strong>Rectificar:</strong> Corregir información inexacta</li>
              <li><strong>Eliminar:</strong> Solicitar la eliminación de tus datos</li>
              <li><strong>Limitar:</strong> Restringir el procesamiento</li>
              <li>
                <strong>Portabilidad:</strong> Recibir una copia de tus datos en formato
                estructurado
              </li>
              <li><strong>Oponerme:</strong> Oponerme al procesamiento de tus datos</li>
            </ul>
            <p class="q-mt-md">
              Para ejercer estos derechos, contáctanos en
              <strong>privacy@rifas.local</strong>
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="7. Cookies y Tecnologías de Seguimiento"
            subtitle="Cómo usamos cookies"
            icon="cookie"
          >
            <p>
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia. Las cookies
              son pequeños archivos que se almacenan en tu dispositivo. Usamos:
            </p>
            <ul>
              <li>
                <strong>Cookies Esenciales:</strong> Necesarias para funcionar (autenticación,
                preferencias)
              </li>
              <li><strong>Cookies de Análisis:</strong> Para entender cómo usas la aplicación</li>
              <li>
                <strong>Cookies de Rendimiento:</strong> Para mejorar la velocidad y funcionalidad
              </li>
            </ul>
            <p class="q-mt-md">
              Puedes controlar las cookies a través de tu navegador, aunque esto puede afectar la
              funcionalidad de la aplicación.
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="8. Enlaces a Sitios Externos"
            subtitle="Responsabilidad externa"
            icon="link"
          >
            <p>
              Nuestra aplicación puede contener enlaces a sitios web de terceros. No somos
              responsables de las prácticas de privacidad de estos sitios. Te recomendamos revisar
              sus políticas de privacidad antes de proporcionar tu información.
            </p>
          </q-timeline-entry>

          <q-timeline-entry
            title="9. Cambios en esta Política"
            subtitle="Actualizaciones"
            icon="update"
          >
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Los cambios
              significativos serán notificados por correo electrónico o a través de la aplicación.
              Tu uso continuado de la aplicación después de los cambios constituye tu aceptación de
              la política actualizada.
            </p>
          </q-timeline-entry>

          <q-timeline-entry title="10. Contacto" subtitle="Preguntas sobre privacidad" icon="mail">
            <p>
              Si tienes preguntas, inquietudes o solicitudes relacionadas con esta Política de
              Privacidad, puedes contactarnos:
            </p>
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

.policy-content {
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
