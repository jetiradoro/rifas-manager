FROM getgrav/grav:latest

USER root

COPY docker/rifas/rifas-docs/init-container.sh /docker/init-container.sh
COPY docker/rifas/rifas-docs/99-host-permissions.sh /docker-entrypoint.d/99-host-permissions.sh
RUN chmod +x /docker/init-container.sh
RUN chmod +x /docker-entrypoint.d/99-host-permissions.sh

ENTRYPOINT ["/docker/init-container.sh"]

