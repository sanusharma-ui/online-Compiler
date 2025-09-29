# Base image with Node.js + Python support
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /usr/src/app

# ---------------------------------------------
# 1️⃣ Install system dependencies for Python & scientific libraries
# ---------------------------------------------
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    build-essential \
    gcc \
    g++ \
    make \
    cmake \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    libatlas-base-dev \
    libffi-dev \
    curl \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------------------------
# 2️⃣ Pre-install Python libraries
# ---------------------------------------------
RUN pip3 install --no-cache-dir \
    numpy \
    pandas \
    requests \
    matplotlib \
    seaborn \
    scipy \
    sympy

# ---------------------------------------------
# 3️⃣ Pre-install global JS tools
# ---------------------------------------------
RUN npm install -g \
    typescript \
    ts-node \
    axios \
    lodash \
    moment

# ---------------------------------------------
# 4️⃣ Copy package.json and install local Node deps
# ---------------------------------------------
COPY package*.json ./
RUN npm install

# ---------------------------------------------
# 5️⃣ Copy the rest of the app
# ---------------------------------------------
COPY . .

# Ensure temp folder exists
RUN mkdir -p server/temp

# ---------------------------------------------
# 6️⃣ Expose port
# ---------------------------------------------
EXPOSE 5000

# ---------------------------------------------
# 7️⃣ Start command
# ---------------------------------------------
CMD ["npm", "start"]
