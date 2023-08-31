async function cargarModelo() {
  try {
    console.log("Cargando modelo...");
    const modelo = await tf.loadLayersModel("./model.json");
    console.log("Modelo cargado");
    return modelo;
  } catch (error) {
    console.error("Error al cargar el modelo:", error);
  }
}

async function predecir(imagen, modelo) {
  if (modelo != null) {
    const img = new Image();
    img.src = URL.createObjectURL(imagen);
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 100, 100);

    const imgData = ctx.getImageData(0, 0, 100, 100);

    let arr = [];
    let arr100 = [];

    for (let p = 0; p < imgData.data.length; p += 4) {
      let rojo = imgData.data[p] / 255;
      let verde = imgData.data[p + 1] / 255;
      let azul = imgData.data[p + 2] / 255;

      arr100.push([rojo, verde, azul]);
      if (arr100.length == 100) {
        arr.push(arr100);
        arr100 = [];
      }
    }

    arr = [arr];
    const tensor = tf.tensor(arr);
    return modelo.predict(tensor).dataSync();
  }
}

async function manejarCargaImagen() {
  const imagenInput = document.getElementById("imagen-input");
  const imagenSubida = document.getElementById("imagen-subida");
  const textoPrediccion = document.getElementById("prediccion");
  const modelo = await cargarModelo();

  imagenInput.addEventListener("change", async function () {
    const imagenElegida = imagenInput.files[0];
    if (imagenElegida) {
      imagenSubida.src = URL.createObjectURL(imagenElegida);
      const prediccion = await predecir(imagenElegida, modelo);
      mostrarPrediccion(prediccion, textoPrediccion);
    }
  });
}

function mostrarPrediccion(prediccion, elemento) {
  const probabilidad = prediccion[0];
  let respuesta = probabilidad <= 0.5 ? "Benigno" : "Maligno";
  elemento.textContent = `Predicción: ${respuesta} (${(probabilidad * 100).toFixed(2)}% de porcentaje maligno)`;
}

document.addEventListener("DOMContentLoaded", manejarCargaImagen);
