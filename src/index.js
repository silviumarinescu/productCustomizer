import productViewer from "./productViewer";

const container = document.querySelector(".container");

const image = `model1_img0.jpg`;
const product = `main_model.gltf`;

productViewer.init({ container, image, product });

document.querySelector("#image").addEventListener("change", async (e) => {
  await productViewer.setImage(`model${e.target.value}_img0.jpg`);
});
