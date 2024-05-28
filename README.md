<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Teslo API

1. Clonar el proyecto
2. Reconstruir los módulos de node
```
npm install
```
3. Duplicar el archivo __.env.template__ a __.env__
4. Configurar las variables de entorno del archivo __.env__
5. Subir la base de datos dockerizada
```
docker-compose up -d
```
6. Ejecutar SEED
```
GET localhost:3000/api/seed
```
7. Levantar la aplicación
```
npm run start:dev
```