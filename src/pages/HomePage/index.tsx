import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import Header from "../../components/Header";
import authSaga from "../../redux/sagas/authSaga";

const HomePage = () => {
    const { t } = useTranslation();
    useEffect(() => {
        authSaga()
       console.log(t('welcome'))
    }, [])
   return (
       <div>
           <Header />
       </div>
   )
}

export default HomePage