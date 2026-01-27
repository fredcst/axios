FROM php:5.6-fpm

# 🔴 FIX Debian Stretch EOL
RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list \
 && sed -i 's|security.debian.org|archive.debian.org|g' /etc/apt/sources.list \
 && sed -i '/stretch-updates/d' /etc/apt/sources.list

# Dependencias necesarias
RUN apt-get update && apt-get install -y \
    libaio1 \
    unzip \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Oracle Instant Client
WORKDIR /opt/oracle

RUN wget -q https://download.oracle.com/otn_software/linux/instantclient/instantclient-basic-linux.x64-12.2.0.1.0.zip \
 && wget -q https://download.oracle.com/otn_software/linux/instantclient/instantclient-sdk-linux.x64-12.2.0.1.0.zip \
 && unzip instantclient-basic-linux.x64-12.2.0.1.0.zip \
 && unzip instantclient-sdk-linux.x64-12.2.0.1.0.zip \
 && rm *.zip \
 && ln -s instantclient_12_2 instantclient

ENV LD_LIBRARY_PATH=/opt/oracle/instantclient
ENV ORACLE_HOME=/opt/oracle/instantclient

# OCI8
RUN docker-php-ext-configure oci8 --with-oci8=instantclient,/opt/oracle/instantclient \
 && docker-php-ext-install oci8

WORKDIR /var/www/html