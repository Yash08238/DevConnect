import classNames from '../../utils/classNames';

export default function Avatar({ src, alt = 'Avatar', username = 'user', size = 'medium', className = '' }) {
  const sizeClass = size === 'large' ? 'avatar-large' : size === 'small' ? 'avatar-small' : '';
  const backupSrc = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

  return (
    <img
      src={src || backupSrc}
      alt={alt}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = backupSrc;
      }}
      className={classNames('avatar', sizeClass, className)}
    />
  );
}
