import { useState, useEffect } from 'react';

const PRESET_RELATIVES = ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆'];

export default function RelativeSelector({ value, onChange, required = true, label = '上传者身份' }) {
  const [selected, setSelected] = useState('');
  const [custom, setCustom] = useState('');

  useEffect(() => {
    if (value) {
      if (PRESET_RELATIVES.includes(value)) {
        setSelected(value);
        setCustom('');
      } else {
        setSelected('other');
        setCustom(value);
      }
    }
  }, [value]);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    setSelected(val);
    if (val !== 'other') {
      setCustom('');
      onChange?.(val || '');
    } else {
      onChange?.(custom || '');
    }
  };

  const handleCustomChange = (e) => {
    const val = e.target.value;
    setCustom(val);
    onChange?.(val);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={selected}
        onChange={handleSelectChange}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        required={required}
      >
        <option value="">请选择身份</option>
        {PRESET_RELATIVES.map((name) => (
          <option key={name} value={name}>{name}</option>
        ))}
        <option value="other">其他</option>
      </select>
      {selected === 'other' && (
        <input
          type="text"
          value={custom}
          onChange={handleCustomChange}
          placeholder="请输入亲属关系"
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          required={required}
        />
      )}
    </div>
  );
}
