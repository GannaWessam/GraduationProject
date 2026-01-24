const { Container, Permission } = require("../../models");

async function addContainer(data) {
  const { name, description } = data;
  if (!name) throw new Error("missing_required");

  const exists = await Container.findOne({ where: { name } });
  if (exists) throw new Error("container_exists");

  const container = await Container.create({ name, description });
  return container;
}

async function getAllContainers() {
  return Container.findAll({
    include: [{ model: Permission, as: "permissions" }],
  });
}

async function getContainerById(id) {
  const container = await Container.findByPk(id, {
    include: [{ model: Permission, as: "permissions" }],
  });
  if (!container) throw new Error("not_found");
  return container;
}

async function updateContainer(id, data) {
  const container = await Container.findByPk(id);
  if (!container) throw new Error("not_found");

  if (data.name) container.name = data.name;
  if (data.description) container.description = data.description;

  await container.save();
  return container;
}

async function deleteContainer(id) {
  const container = await Container.findByPk(id);
  if (!container) throw new Error("not_found");

  await container.destroy();
  return { deleted: true };
}

module.exports = {
  addContainer,
  getAllContainers,
  getContainerById,
  updateContainer,
  deleteContainer,
};
