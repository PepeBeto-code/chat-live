import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';

const FormatearFecha = ({ createdAt }) => {
  const fecha = new Date(createdAt);

  let fechaFormateada;
  if (isToday(fecha)) {
    fechaFormateada = `Hoy a las ${format(fecha, 'HH:mm:ss')}`;
  } else if (isYesterday(fecha)) {
    fechaFormateada = `Ayer a las ${format(fecha, 'HH:mm:ss')}`;
  } else {
    fechaFormateada = format(fecha, 'MMM d, yyyy');
  }

  return <span className="chat-list__item-time">{fechaFormateada}</span>;
};

export default FormatearFecha;