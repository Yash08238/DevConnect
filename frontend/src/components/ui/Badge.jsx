import classNames from '../../utils/classNames';

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={classNames(
        'badge',
        variant === 'accent' && 'badge-accent',
        className
      )}
    >
      {children}
    </span>
  );
}
