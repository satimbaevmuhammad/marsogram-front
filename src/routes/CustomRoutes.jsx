import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import NotFound from '../pages/NotfoundPage'
import About from '../pages/About'
import Chats from '../pages/Chats'
import Settings from '../pages/Settings'
import Home from '../pages/Home'

const CustomRoutes = () => {
    return (
        <div>
            <Routes>
                <Route path='/' element={<Dashboard />} >
                    <Route path='about' element={<About/>}/>
                    <Route index element={<Home/>}/>
                    <Route path='chats' element={<Chats/>}/>
                    <Route path='settings' element={<Settings/>}/>
                </Route>
                <Route path='*' element={<NotFound />} />

            </Routes>
        </div>
    )
}

export default CustomRoutes