import classNames from '../../utils/classNames';

export default function Button({ children, className = '', variant = 'primary', ...props }) {
  return (
    <button
      className={classNames('btn', `btn-${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
