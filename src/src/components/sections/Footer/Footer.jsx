import React from "react";
import './Footer.css';
import '../../General.css'

function Footer() {
    return (
        <footer className="footer">
            <div className="right-hr-white">
                <div>
                    <h3 className="title mid-spaced-out">About</h3>
                    <p>Five-Seventy-Five <br />
                        is a website which features<br />
                        different haikus</p>
                    <p>'Haiku(s)' refers to <br />
                        poem(s) with a five-seven <br />
                        five syllable theme</p>
                    <p>
                        Haikus are a form <br />
                        of poetry from Japan <br />
                        but have global fame <br />
                    </p>
                    <p>Five-Seventy-Five <br />
                        lets users read, write, review <br />
                        different haikus
                    </p>
                </div>
            </div>
            <hr className="phone-hr white"></hr>
            <div>
                <div>
                    <h3 className="title mid-spaced-out">Contacts</h3>
                    <p>Made by Gurlakshpreet Kaur<br /><br />
                        LinkedIn: <a href="https://www.linkedin.com/in/gurlakshpreetkaur" target="_blank">Gurlakshpreet Kaur</a><br />
                        GitHub: <a href="https://www.github.com/gurlakshpreetKaur" target="_blank">@gurlakshpreetKaur</a><br />
                        E-Mail: <a href="mailto:gurlakshpreetkaur@gmail.com">gurlakshpreetkaur@gmail.com</a><br /></p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;