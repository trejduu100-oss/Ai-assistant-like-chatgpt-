
import React, { useState, useMemo } from 'react';
import { Model, ModelProvider } from '../types';
import { ALL_MODELS } from '../constants';

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

const ModelInfoPanel: React.FC<{ model: Model }> = ({ model }) => (
  <div className="absolute top-full mt-2 w-64 bg-light-main dark:bg-dark-model-msg p-4 rounded-lg shadow-lg border border-light-border dark:border-dark-border text-sm text-light-text-secondary dark:text-dark-text-secondary">
    <h4 className="font-bold text-light-text-primary dark:text-dark-text-primary mb-2">{model.name}</h4>
    <p>Provider: {model.provider}</p>
    <p>Context: {model.context.toLocaleString()} tokens</p>
    <p>Speed: {model.speed}</p>
    <p>Vision Support: {model.vision ? 'Yes' : 'No'}</p>
  </div>
);

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModelId, onModelChange }) => {
  const [isInfoPanelVisible, setInfoPanelVisible] = useState(false);

  const groupedModels = useMemo(() => {
    return ALL_MODELS.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {} as Record<ModelProvider, Model[]>);
  }, []);

  const selectedModel = ALL_MODELS.find(m => m.id === selectedModelId)!;

  return (
    <div className="relative">
      <select
        value={selectedModelId}
        onChange={(e) => onModelChange(e.target.value)}
        onMouseEnter={() => setInfoPanelVisible(true)}
        onMouseLeave={() => setInfoPanelVisible(false)}
        className="w-full p-2 bg-light-main dark:bg-dark-model-msg border border-light-border dark:border-dark-border rounded-md appearance-none cursor-pointer text-light-text-primary dark:text-dark-text-primary"
      >
        {(Object.keys(groupedModels) as ModelProvider[]).map(provider => (
          <optgroup key={provider} label={provider}>
            {groupedModels[provider].map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      {isInfoPanelVisible && <ModelInfoPanel model={selectedModel} />}
    </div>
  );
};

export default ModelSelector;
