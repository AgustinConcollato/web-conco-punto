import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PriceProvider } from './context/PriceContext';
import { CartProvider } from './context/CartContext';
import { ClientAuthProvider } from './context/ClientAuthContext';
import { SiteHeader } from './components/SiteHeader/SiteHeader';
import { CatalogPage } from './features/catalog/pages/CatalogPage/CatalogPage';
import { ProductPage } from './features/product/pages/ProductPage/ProductPage';
import { CartPage } from './features/cart/pages/CartPage/CartPage';
import { CheckoutPage } from './features/cart/pages/CheckoutPage/CheckoutPage';
import { ConfirmationPage } from './features/cart/pages/ConfirmationPage/ConfirmationPage';
import { LoginPage } from './features/auth/pages/LoginPage/LoginPage';
import { RegisterPage } from './features/auth/pages/RegisterPage/RegisterPage';
import { ProfilePage } from './features/account/pages/ProfilePage/ProfilePage';

function App() {
    return (
        <ClientAuthProvider>
            <PriceProvider>
                <CartProvider>
                    <BrowserRouter>
                        <SiteHeader />
                        <Routes>
                            <Route path="/" element={<CatalogPage />} />
                            <Route path="/categoria/:slug" element={<CatalogPage />} />
                            <Route path="/categoria/:slug/:childSlug" element={<CatalogPage />} />
                            <Route path="/productos/:id" element={<ProductPage />} />
                            <Route path="/productos/:id/variante/:vid" element={<ProductPage />} />
                            <Route path="/carrito" element={<CartPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/pedido-confirmado" element={<ConfirmationPage />} />
                            <Route path="/iniciar-sesion" element={<LoginPage />} />
                            <Route path="/registro" element={<RegisterPage />} />
                            <Route path="/perfil" element={<ProfilePage />} />
                        </Routes>
                    </BrowserRouter>
                </CartProvider>
            </PriceProvider>
        </ClientAuthProvider>
    );
}

export default App;
