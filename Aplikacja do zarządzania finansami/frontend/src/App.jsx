import { useState } from 'react'
import { Navigate, Outlet, replace, Route, Routes } from 'react-router-dom';
import Logowanie from './pages/logowanie';
import Rejestracja from './pages/rejestracja';
import Panel from './pages/panel';
import Ustawienia from './pages/ustawienia';
import Konta from './pages/konto';
import Transakcje from './pages/transakcje';
import useStore from './store/index'
import { setAuthToken } from './libs/apiCalls';
import { Toaster } from 'sonner';
import Navbar from './components/navbar';

const RootLayout = () => {
  const {user} = useStore((state)=>state);
  setAuthToken(user?.token || "");
  return !user ? ( <Navigate to="logowanie" replace={true}/> ) : ( 
  <>
  <Navbar/> 
    <div className='min-h-[cal(h-screen-100px)]'> 
      <Outlet />
    </div>
  </>
  );
};

function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
      <div className='w-full min-h-screen bg-white'>
        
        <Routes>
          
          <Route element={<RootLayout />}>
            <Route path='/' element={<Navigate to="/panel"/>} />
            <Route path='/panel' element={<Panel />} />
            <Route path='/transakcje' element={<Transakcje />} />
            <Route path='/ustawienia' element={<Ustawienia />} />
            <Route path='/konta' element={<Konta />} />
          </Route>

          <Route path='/logowanie' element={<Logowanie/>} />
          <Route path='/rejestracja' element={<Rejestracja/>} />
        </Routes>
      </div>
      <Toaster richColors position='top-center'/>
    </main>
  )
}

export default App
