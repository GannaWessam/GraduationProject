export const updateIfChanged = async (modelInstance, data, transaction) => {
    if (!data || Object.keys(data).length === 0)
      return { updated: false, model: modelInstance };
  
    const hasChanges = Object.entries(data).some(
      ([key, value]) => modelInstance[key] !== value
    );
  
    if (!hasChanges) return { updated: false, model: modelInstance };
  
    const updatedModel = await modelInstance.update(data, { transaction });
    return { updated: true, model: updatedModel };
  };
  