import productViewer from "./productViewer";

const container = document.querySelector(".container");

const image = `model1_img0.jpg`;
const product = `model1.gltf`;

productViewer.init({ container, image, product });

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

  document
  .querySelector("#bg-image")
  .addEventListener("change", async (e) => {
    const file = await getFile(e.target.files[0]);
    document.querySelector(".bg").setAttribute("src",file)
  });

  document
  .querySelector("#fg-image")
  .addEventListener("change", async (e) => {
    const file = await getFile(e.target.files[0]);
    document.querySelector(".fg").setAttribute("src",file)
  });
  


document
  .querySelector("#custom-model")
  .addEventListener("change", async (e) => {
    const file = await getFile(e.target.files[0]);

    await productViewer.setModel(file);
  });

document.querySelector(".save").addEventListener("click", async () => {
  const width = 2000;
  const height = 2000;
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
