# 👶🤖🖥️ BabyAGI UI

[![GitHub last commit](https://img.shields.io/github/last-commit/miurla/babyagi-ui)](https://github.com/miurla/babyagi-ui/commit/main)
[![Discord](https://img.shields.io/discord/1111177037055529012)](https://discord.gg/8nMD4X6RJm)
[![Twitter Follow](https://img.shields.io/twitter/follow/miiura?style=social)](https://twitter.com/miiura)
[![GitHub Repo stars](https://img.shields.io/github/stars/miurla/babyagi-ui?style=social)](https://github.com/miurla/babyagi-ui/stargazers)

BabyAGI UI está diseñado para facilitar la ejecución y el desarrollo con [Babyagi](https://github.com/yoheinakajima/babyagi) en una aplicación web, como un ChatGPT.
Este es un puerto de [Babyagi](https://github.com/yoheinakajima/babyagi) con [Langchain.js](https://github.com/hwchase17/langchainjs) y construir una interfaz de usuario.

![](./public/images/screenshot-230625.png)
[Demo](https://twitter.com/miiura/status/1653026609606320130)

## 💡 Obtener ayuda

*   [Discordia](https://discord.gg/8nMD4X6RJm) 💬

## 🧰 Pila

*   [Siguiente.js](https://nextjs.org/)
*   [Piña](https://www.pinecone.io/)
*   [LangChain.js](https://github.com/hwchase17/langchainjs)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Interfaz de usuario de Radix](https://www.radix-ui.com/)

## 🚗 Hoja de ruta

*   \[x] El BabyAGI puede buscar y raspar la web. ([🐝 BabyBeeAGI](https://twitter.com/yoheinakajima/status/1652732735344246784))
*   \[x] Exportación de resultados de ejecución
*   \[x] Historial de ejecución
*   \[x] Velocidades más rápidas y menos errores. ([😺 BabyCatAGI](https://twitter.com/yoheinakajima/status/1657448504112091136))
*   \[x] Soporte i18n ( 🇧🇷 , , , , , 🇫🇷 🇮🇳 , , 🇭🇺 🇩🇪 🇷🇺 🇺🇸 🇪🇸 🇯🇵 🇹🇭 ... y mucho más)
*   \[x] Comentarios de los usuarios
*   \[x] Improv UX para la creación de tareas (solo BabyCatAGI🐱 y solicitud del cliente)
*   \[x] Notificación de que se han completado todas las tareas. 🔔
*   \[x] Mostrar la tarea actual y la lista de tareas. 📌
*   \[x] Barra ⏩️ lateral contraíble
*   \[x] Entrada del usuario y tareas paralelas. ([🦌 BabyDeerAGI](https://twitter.com/yoheinakajima/status/1666313838868992001))
*   \[x] Compatibilidad con actualizaciones de API (gpt-3.5-turbo-0613/gpt-3.5-turbo-16k-0613/gpt-4-0613)

y más...

## 👉 Empezar

1.  Clonar el repositorio

```sh
git clone https://github.com/miurla/babyagi-ui
```

2.  Ir al titular del proyecto

```sh
cd babyagi-ui
```

3.  Instalar paquetes con npm

```sh
npm install
```

4.  Configure su archivo .env. Y establecer las variables.
    *   Debe crear un índice por adelantado con [Piña](https://www.pinecone.io/).
        *   [Configuración de referencia](./public/pinecone-setup.png)
    *   Establezca su clave SerpAPI, si desea utilizar la herramienta de búsqueda con BabyBeeAGI.

```sh
cp .env.example .env
```

5.  Ejecutar el proyecto

```sh
npm run dev
```

## 🚀 Desplegar

### Vercel

Aloje su propia versión en vivo de BabyAGI UI con Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmiurla%2Fbabyagi-ui)

## ⚠️ Advertencia

Este script está diseñado para ejecutarse continuamente como parte de un sistema de administración de tareas. Ejecutar este script continuamente puede resultar en un alto uso de la API, así que úselo de manera responsable. Además, el script requiere que la API de OpenAI esté configurada correctamente, así que asegúrese de haber configurado la API antes de ejecutar el script.

[Texto original en](https://github.com/yoheinakajima/babyagi#warning)

## 🎗️ Patrocinador Oficial

[<img src="./public/images/serpapi-logo.svg" width=20% />
](https://serpapi.com/)

*   El equipo de SerpApi proporciona los créditos de la API de búsqueda para las solicitudes realizadas en [El sitio de demostración](https://babyagi-ui.vercel.app/) de este proyecto! ⭐️
*   🔍 [SerpApi](https://serpapi.com/): Elimine Google y otros motores de búsqueda de nuestra API rápida, fácil y completa.

## Crédito

### BabyAGI

*   Github: https://github.com/yoheinakajima/babyagi
*   Autor: [@yoheinakajima](https://github.com/yoheinakajima)
