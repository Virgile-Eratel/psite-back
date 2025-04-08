FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de configuration et installer les dépendances
COPY package.json yarn.lock ./
RUN yarn install

# Copier le reste du code
COPY . .

# Construire l'application (assurez-vous d'avoir un script "build" dans votre package.json)
RUN yarn build

# Exposer le port (par défaut 3000 pour NestJS)
EXPOSE 3000

# Lancer l'application en production
CMD ["yarn", "start:prod"]