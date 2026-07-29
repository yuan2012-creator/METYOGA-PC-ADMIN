import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface ResearchFieldErrorProps {
  message?: string | null;
}

export const ResearchFieldError: React.FC<ResearchFieldErrorProps> = ({ message }) =>
  message ? <p className="met-rc-v2-field-error" role="alert">{message}</p> : null;

interface ResearchSelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export const ResearchSelect: React.FC<ResearchSelectProps> = ({
  value,
  options,
  onChange,
  placeholder,
  disabled,
  id,
}) => (
  <select
    id={id}
    className="met-rc-v2-input"
    value={value}
    disabled={disabled}
    onChange={e => onChange(e.target.value)}
  >
    {placeholder ? <option value="">{placeholder}</option> : null}
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

interface ResearchDateFieldProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  id?: string;
}

export const ResearchDateField: React.FC<ResearchDateFieldProps> = ({ value, onChange, min, max, id }) => (
  <input
    id={id}
    type="date"
    className="met-rc-v2-input met-rc-v2-input--date"
    value={value}
    min={min}
    max={max}
    onChange={e => onChange(e.target.value)}
  />
);

interface ResearchTimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}

export const ResearchTimeField: React.FC<ResearchTimeFieldProps> = ({ value, onChange, id }) => (
  <input
    id={id}
    type="time"
    className="met-rc-v2-input met-rc-v2-input--time"
    value={value}
    onChange={e => onChange(e.target.value)}
  />
);

interface ResearchNumberFieldProps {
  value: number | '';
  onChange: (value: number | '') => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  id?: string;
}

export const ResearchNumberField: React.FC<ResearchNumberFieldProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  id,
}) => (
  <div className="met-rc-v2-number-field">
    {prefix ? <span className="met-rc-v2-number-field__prefix">{prefix}</span> : null}
    <input
      id={id}
      type="number"
      className="met-rc-v2-input"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={e => {
        const raw = e.target.value;
        onChange(raw === '' ? '' : Number(raw));
      }}
    />
    {suffix ? <span className="met-rc-v2-number-field__suffix">{suffix}</span> : null}
  </div>
);

interface ResearchTextFieldProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export const ResearchTextField: React.FC<ResearchTextFieldProps> = ({ value, onChange, id, placeholder }) => (
  <input
    id={id}
    type="text"
    className="met-rc-v2-input"
    value={value}
    placeholder={placeholder}
    onChange={e => onChange(e.target.value)}
  />
);

interface ResearchToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const ResearchToggle: React.FC<ResearchToggleProps> = ({ checked, onChange, label }) => (
  <label className="met-rc-v2-toggle">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="met-rc-v2-toggle__track" aria-hidden />
    {label ? <span className="met-rc-v2-toggle__label">{label}</span> : null}
  </label>
);

interface ResearchInlineEditActionsProps {
  onSave: () => void;
  onCancel: () => void;
}

export const ResearchInlineEditActions: React.FC<ResearchInlineEditActionsProps> = ({ onSave, onCancel }) => (
  <div className="met-rc-v2-inline-edit__actions">
    <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm" onClick={onSave}>
      保存
    </button>
    <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={onCancel}>
      取消
    </button>
  </div>
);

interface ResearchInlineEditRowProps {
  children: React.ReactNode;
  actions: React.ReactNode;
  error?: string | null;
}

export const ResearchInlineEditRow: React.FC<ResearchInlineEditRowProps> = ({ children, actions, error }) => (
  <div className="met-rc-v2-inline-edit-wrap">
    <div className="met-rc-v2-inline-edit">
      <div className="met-rc-v2-inline-edit__input">{children}</div>
      {actions}
    </div>
    <ResearchFieldError message={error} />
  </div>
);

interface StaffSelectorProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export const StaffSelector: React.FC<StaffSelectorProps> = ({ value, options, onChange, placeholder = '请选择' }) => (
  <select className="met-rc-v2-input" value={value} onChange={e => onChange(e.target.value)}>
    <option value="">{placeholder}</option>
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}{opt.hint ? ` · ${opt.hint}` : ''}
      </option>
    ))}
  </select>
);

interface VenueClassroomSelectorProps {
  venue: string;
  classroom: string;
  venueOptions: SelectOption[];
  classroomOptions: SelectOption[];
  onVenueChange: (venue: string) => void;
  onClassroomChange: (classroom: string) => void;
  venueError?: string | null;
  classroomError?: string | null;
}

export const VenueClassroomSelector: React.FC<VenueClassroomSelectorProps> = ({
  venue,
  classroom,
  venueOptions,
  classroomOptions,
  onVenueChange,
  onClassroomChange,
  venueError,
  classroomError,
}) => (
  <div className="met-rc-v2-venue-classroom">
    <div>
      <ResearchSelect value={venue} options={venueOptions} onChange={onVenueChange} placeholder="请选择场地" />
      <ResearchFieldError message={venueError} />
    </div>
    <div>
      <ResearchSelect
        value={classroom}
        options={classroomOptions}
        onChange={onClassroomChange}
        placeholder="请选择教室"
        disabled={!venue}
      />
      <ResearchFieldError message={classroomError} />
    </div>
  </div>
);

export function confirmDiscardUnsaved(): boolean {
  return window.confirm('当前修改尚未保存，是否放弃？\n\n继续编辑请点取消，放弃修改请点确定。');
}
