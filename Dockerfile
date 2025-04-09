# Create runtime image
FROM node:22.14.0-slim

# Switch workdir - this specific directory is used in standard configurations of e.g. getting-started to mount the repository folder
WORKDIR /usr/src/app

# Create folders for case model repository and deployment
RUN mkdir ./repository && mkdir ./repository_deploy && chown -R 1000:1000 ./repository*

# Copy build result to runtime image
COPY --chown=1000:1000 ./dist/server ./dist/server
COPY --chown=1000:1000 ./dist/app ./dist/app

# Expose ide port and run as non-root user
EXPOSE 2081
USER 1000

# Start the IDE
CMD ["node", "dist/server/server.js" ]
