import productViewer from "./productViewer";

const container = document.querySelector(".container");

const image = `model1_img0.jpg`;
const product = `model1.gltf`;

productViewer.init({
  container,
  image,
  product,
  cameraUpdate: (
    positionX,
    positionY,
    positionZ,
  ) => {
    document.querySelector("#positionX").value = positionX;
    document.querySelector("#positionY").value = positionY;
    document.querySelector("#positionZ").value = positionZ;
  },
});

document.querySelector("#image").addEventListener("change", async (e) => {
  await productViewer.setImage(`model${e.target.value}_img0.jpg`);
});

document.querySelector("#model").addEventListener("change", async (e) => {
  await productViewer.setModel(`model${e.target.value}.gltf`);
});

const getFile = (file) =>
  new Promise((a) => {
    let reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => {
      a(reader.result);
    };
  });

document
  .querySelector("#custom-image")
  .addEventListener("change", async (e) => {
    const file = await getFile(e.target.files[0]);

    await productViewer.setImage(file);
  });

document.querySelector("#bg-image").addEventListener("change", async (e) => {
  const file = await getFile(e.target.files[0]);
  document.querySelector(".bg").setAttribute("src", file);
});

document.querySelector("#fg-image").addEventListener("change", async (e) => {
  const file = await getFile(e.target.files[0]);
  document.querySelector(".fg").setAttribute("src", file);
});

document
  .querySelector("#custom-model")
  .addEventListener("change", async (e) => {
    const file = await getFile(e.target.files[0]);

    await productViewer.setModel(file);
  });

const getCamera = () => {
  return [
    parseFloat(document.querySelector("#positionX").value),
    parseFloat(document.querySelector("#positionY").value),
    parseFloat(document.querySelector("#positionZ").value),
    parseFloat(document.querySelector("#rotationX").value),
    parseFloat(document.querySelector("#rotationY").value),
    parseFloat(document.querySelector("#rotationZ").value),
  ];
};

const renderFinalImage = async () => {
  const width = 1000;
  const height = 1000;
  const image = await productViewer.getImage(width, height);

  await overlayImages(
    [
      document.querySelector(".bg").getAttribute("src"),
      image,
      document.querySelector(".fg").getAttribute("src"),
    ],
    width,
    height
  );
};

document.querySelector("#positionX").addEventListener("change", async (e) => {
  await productViewer.setCamera(...getCamera());
  await renderFinalImage();
});
document.querySelector("#positionY").addEventListener("change", async (e) => {
  await productViewer.setCamera(...getCamera());
  await renderFinalImage();
});

document.querySelector("#positionZ").addEventListener("change", async (e) => {
  await productViewer.setCamera(...getCamera());
  await renderFinalImage();
});

document.querySelector("#rotationX").addEventListener("change", async (e) => {
  await productViewer.setCamera(...getCamera());
  await renderFinalImage();
});
document.querySelector("#rotationY").addEventListener("change", async (e) => {
  await productViewer.setCamera(...getCamera());
  await renderFinalImage();
});

document.querySelector("#rotationZ").addEventListener("change", async (e) => {
  await productViewer.setCamera(...getCamera());
  await renderFinalImage();
});

document.querySelector(".save").addEventListener("click", async () => {
  await renderFinalImage();
});

const genImage = (image) =>
  new Promise((a) => {
    let img = document.createElement("img");
    img.addEventListener("load", () => {
      a(img);
    });
    img.src = image;
  });

const overlayImages = async (
  images,
  width = 300,
  height = 300,
  mode = "cover"
) => {
  const canvas = document.querySelector(".result");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  for (const image of images) {
    const img = await genImage(image);
    ctx.drawImage(img, width / 2 - width / 2, 0, width, height);
  }
};
