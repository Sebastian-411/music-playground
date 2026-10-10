# music-playground

Plataforma para tocar instrumentos en el navegador. El primero es la marimba, el piano de la selva: un modelo 3D que se puede girar, tocar con el mouse en las láminas y tocar con el teclado. Los controles se pueden reasignar.

```bash
npm install
npm run dev
```

Para desplegarla:

```bash
docker build -t music-playground .
docker run --rm -p 8080:80 music-playground
```

La app queda en `http://localhost:8080`.
