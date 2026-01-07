# Utilisation de Node 20 (LTS en 2026, plus performant que la 18)
FROM node:20-alpine

# Dossier de l'app
WORKDIR /app

# On utilise 'npm ci' au lieu de 'npm install' pour garantir 
# que les versions du lockfile sont respectées à 100%
COPY package*.json ./
RUN npm ci --only=production

# Copie du reste du code
COPY . .

# Sécurité : On ne tourne pas en 'root'
# L'image officielle node fournit un utilisateur 'node'
USER node

# Port par défaut (sera surchargé par Northflank)
ENV PORT=8080
EXPOSE 8080

CMD [ "npm", "start" ]