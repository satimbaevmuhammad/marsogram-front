    import React from 'react'
    import { Route, Routes } from 'react-router-dom'
    import Dashboard from '../pages/Dashboard'
    import NotFound from '../pages/NotfoundPage'
    import About from '../pages/About'
    import Settings from '../pages/Settings'
    import Home from '../pages/Home'
    import ChatPage from '../pages/ChatPage'

    const CustomRoutes = () => {
        return (
            <div>
                <Routes>
                    <Route path='/' element={<Dashboard />} >
                        <Route path='about' element={<About/>}/>
                        <Route index element={<Home/>}/>
                        <Route path='chats' element={<ChatPage/>}/>
                        <Route path='settings' element={<Settings/>}/>
                    </Route>
                    <Route path='*' element={<NotFound />} />

                </Routes>
            </div>
        )
    }

    export default CustomRoutes