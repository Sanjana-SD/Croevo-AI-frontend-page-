import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Creators from '../components/Creators';

const Home = ({ onOpenWaitlist }) => {
  return (
    <>
      <Hero onOpenWaitlist={onOpenWaitlist} />
      <Features onOpenWaitlist={onOpenWaitlist} />
      <Creators />
    </>
  );
};

export default Home;
