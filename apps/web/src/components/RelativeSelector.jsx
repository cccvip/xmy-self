import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const handleSelectChange = (val) => {
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
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select value={selected} onValueChange={handleSelectChange}>
        <SelectTrigger>
          <SelectValue placeholder="请选择身份" />
        </SelectTrigger>
        <SelectContent>
          {PRESET_RELATIVES.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
          <SelectItem value="other">其他</SelectItem>
        </SelectContent>
      </Select>
      {selected === 'other' && (
        <Input
          type="text"
          value={custom}
          onChange={handleCustomChange}
          placeholder="请输入亲属关系"
          required={required}
        />
      )}
    </div>
  );
}
