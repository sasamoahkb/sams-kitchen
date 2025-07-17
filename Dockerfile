FROM node:18

# Use /src as the working directory
WORKDIR /src

# Copy only dependency files first (for caching)
COPY package*.json ./

# Install dependencies (production only)
# RUN npm ci --omit=deV

# Optional: install supervisor if needed
RUN npm install

# Copy the rest of your app code
COPY . .

# Set the user to non-root
USER node

# Expose app port
EXPOSE 3030

# Start the app
CMD ["node", "index.js"]