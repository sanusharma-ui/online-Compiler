# Use Node.js LTS
FROM node:18

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install

# Pre-install Python libraries
RUN pip3 install numpy pandas matplotlib requests scipy scikit-learn

# Copy the rest of the code
COPY . .

EXPOSE 5000
CMD ["npm", "start"]

