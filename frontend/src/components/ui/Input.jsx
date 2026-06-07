import classNames from '../../utils/classNames';

export default function Input({ label, error, className = '', id, ...props }) {
  return (
    <div className="form-group">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        className={classNames('form-control', className)}
        {...props}
      />
      {error && <span style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '4px' }}>{error}</span>}
    </div>
  );
}
