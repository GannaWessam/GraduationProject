const { Container, Permission } = require("../../models");

async function addContainer(data, req) {
  const { name, description } = data;
  if (!name) throw new Error("missing_required");

  const exists = await Container.findOne({ where: { name } });
  if (exists) throw new Error("container_exists");

  const container = await Container.create({ name, description });

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: container.containerId,
      name: container.name,
    };
    req.audit.message =
      "Permission container created successfully | تم إنشاء حاوية الصلاحيات بنجاح";
  }

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

async function updateContainer(id, data, req) {
  const container = await Container.findByPk(id);
  if (!container) throw new Error("not_found");

  if (data.name) container.name = data.name;
  if (data.description) container.description = data.description;

  await container.save();

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: container.containerId,
      name: container.name,
    };
    req.audit.message =
      "Permission container updated successfully | تم تحديث حاوية الصلاحيات بنجاح";
  }

  return container;
}

async function deleteContainer(id, req) {
  const container = await Container.findByPk(id);
  if (!container) throw new Error("not_found");

  await container.destroy();

  if (req && req.audit) {
    req.audit.affectedThing = {
      _id: id,
      name: container.name,
    };
    req.audit.message =
      "Permission container deleted successfully | تم حذف حاوية الصلاحيات بنجاح";
  }

  return { deleted: true };
}

module.exports = {
  addContainer,
  getAllContainers,
  getContainerById,
  updateContainer,
  deleteContainer,
};
