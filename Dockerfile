# Base image
FROM node:20-alpine

# Install Python3 + pip + bash
RUN apk add --no-cache python3 py3-pip bash

# Pre-install Python modules
RUN pip3 install --no-cache-dir numpy pandas requests matplotlib seaborn scipy sympy

# Pre-install global JS packages for testing
RUN npm install -g typescript ts-node axios lodash moment

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Ensure temp folder exists
RUN mkdir -p server/temp

# Expose port
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
