import React from 'react';
import UsersActive from '../../../components/UsersList';
function page() {
    return (
        <div className='h-full flex justify-center flex-col items-center'>
            <h1 className='pb-1 text-2xl'>Empieza a chatear</h1>
            <UsersActive></UsersActive>
        </div>
        );
}

export default page;