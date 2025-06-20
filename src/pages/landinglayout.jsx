
import { Fragment, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Provider } from "react-redux";
import store from '../redux/store';
import Landingswitcher from '../components/common/switcher/landingswitcher';
import Tabtotop from '../components/common/tabtotop/tabtotop';

function Landinglayout() {
  useEffect(() => {
		import("preline");

	}, []);

  
  return (
    <Fragment>
      <Provider store={store}>
          <Landingswitcher/>
          <Outlet />
          <Tabtotop/>
      </Provider>
    </Fragment>
  );
}

export default Landinglayout;

