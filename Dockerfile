# Base image with Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# ---------------------------------------------
# 1️⃣ Install system dependencies for Python
# ---------------------------------------------
RUN apk add --no-cache \
    python3 \
    py3-pip \
    bash \
    build-base \
    gcc \
    g++ \
    musl-dev \
    python3-dev \
    linux-headers \
    gfortran \
    lapack \
    lapack-dev \
    openblas \
    openblas-dev \
    cmake \
    make

# ---------------------------------------------
# 2️⃣ Pre-install Python modules
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
