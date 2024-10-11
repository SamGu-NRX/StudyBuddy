"use client";
import { signOut } from 'next-auth/react';

import Navbar from '../../components/Navbar';
import { Center, Box, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

const Dashboard = () => {
    return (
        <div>
            <Box bg='DodgerBlue' p={45} color='white'>
                <h1 className="text-2xl font-bold align-middle ml-5 mt-15">Welcome, Arthur</h1>
                <button onClick={() => signOut()} className="mt-4 px-4 py-2 ml-5 bg-red-500 text-white rounded">Sign Out</button>
            </Box>
            <Tabs variant='enclosed' colorScheme='green'>
                <TabList>
                    <Tab>One</Tab>
                    <Tab>Two</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel>
                        {/* <div className="grid grid-rows-3 grid-flow-col gap-6">
                            <div className="row-span-6 shadow-lg">01</div>
                            <div className="col-span-2 shadow-lg">02</div>
                            <div className="row-span-2 col-span-2 shadow-lg">03</div>
                        </div> */}
                    </TabPanel>
                    <TabPanel>
                        <p>two!</p>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    );
}

export default Dashboard;