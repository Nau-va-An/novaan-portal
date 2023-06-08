import { snowflakeCursor } from '@/utils/fun/SnowFlake';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type SignInData = {
  username: string;
  password: string;
};

const SignIn = () => {
  const { register, handleSubmit } = useForm<SignInData>();

  useEffect(() => {
    // Enable to see something funny
    // snowflakeCursor();
  }, []);

  const onSignIn = () => {
    handleSubmit(() => {
      // Call sign in API
    });
  };

  return (
    <div className="h-screen flex items-center justify-center flex-col">
      <form
        onSubmit={onSignIn}
        className="w-1/3 mt-12 flex flex-col items-center justify-center"
      >
        <div className="flex flex-col w-full">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            className="mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            {...(register('username'), { required: true })}
          />
        </div>
        <div className="mt-4 flex flex-col w-full">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter password"
            className="mt-2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            {...(register('password'), { required: true })}
          />
        </div>
        <button className="mt-8 px-4 py-2 rounded-lg text-xl bg-white text-gray-800">
          sign in
        </button>
      </form>
    </div>
  );
};

export default SignIn;
