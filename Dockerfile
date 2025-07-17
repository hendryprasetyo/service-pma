FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

RUN npx prisma generate

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["node", "src/index.js"]