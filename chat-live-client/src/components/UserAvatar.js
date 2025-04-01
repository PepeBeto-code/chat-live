// components/UserAvatar.js
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const UserAvatar = ({ imageSrc, isConnected = true, width = '', height =''}) => {
  const renderAvatar = imageSrc ? (
    <Image
      src={imageSrc}
      alt="User Avatar"
      width={100}
      height={100}
      className={`border-4 rounded-full duration-300 ${width} ${height}`}
      style={{borderColor: 'var(--bg-secondary)'}}
    />
  ) : (
    <FontAwesomeIcon
      icon={faUser}
      className={`border-4  rounded-full duration-300 ${width} ${height}`}
      style={{borderColor: 'var(--bg-secondary)'}}
    />
  );

  return (
    <div className="relative inline-block">
      {renderAvatar}
      <div
        className={`absolute bottom-0 right-0 w-4 h-4 ${
          isConnected ? 'bg-green-500' : 'bg-gray-500'
        } border-2 rounded-full`}
      ></div>
    </div>
  );
};

export default UserAvatar;
