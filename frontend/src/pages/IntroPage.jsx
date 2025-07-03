import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const IntroPage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    console.log('Login button clicked');
    navigate('/login');
  };

  return (
    <div className="desktop2Parent">
      <div className="desktop2">
        <div className="desktop2Child" />
        <div className="extraInfo">
          <div className="signUpArea">
            <b className="youCanBe">You can be one step ahead.</b>
            <div className="signUpTo">Sign up to hear about our updates on the dot.</div>
            <div className="signUpAreaChild" />
            <div className="yourEmailAddress">Your email address</div>
            <div className="signUp">SIGN UP</div>
          </div>
          <div className="customerServicesParent">
            <b className="customerServices">CUSTOMER SERVICES</b>
            <b className="aboutUs">ABOUT US</b>
            <b className="materialCare">MATERIAL CARE</b>
            <b className="mainLocations">MAIN LOCATIONS</b>
            <div className="contactUs">Contact Us</div>
            <div className="origins">Origins</div>
            <div className="jewelryRepair">Jewelry Repair</div>
            <div className="hoChiMinh">Ho Chi Minh City, VN</div>
            <div className="sanFranciscoCa">San Francisco, CA</div>
            <div className="newYorkNy">New York, NY</div>
            <div className="haNoiVn">Ha Noi, VN</div>
            <div className="ringSizing">Ring Sizing</div>
            <div className="metalAllergyResources">Metal Allergy Resources</div>
            <div className="stylingTips">Styling Tips</div>
            <div className="ourPurpose">Our Purpose</div>
            <div className="careers">Careers</div>
            <div className="sustainability">Sustainability</div>
            <div className="givingBack">Giving Back</div>
            <div className="trackYourOrder">Track your Order</div>
            <div className="scheduleAnAppointment">Schedule an appointment</div>
            <div className="shippingReturns">Shipping & Returns</div>
            <div className="frequentlyAskedQuestions">Frequently Asked Questions</div>
          </div>
          <div className="socials">
            <img className="akarIconslinkedinBoxFill" alt="" src="/akar-icons_linkedin-box-fill.svg" />
            <img className="akarIconsyoutubeFill" alt="" src="/youtube.svg" />
            <img className="bxlfacebookCircleIcon" alt="" src="/facebook.svg" />
            <img className="akarIconstwitterFill" alt="" src="/twitter.svg" />
            <img className="akarIconsinstagramFill" alt="" src="/instagram.svg" />
          </div>
          <div className="extraInfoChild" />
          <div className="privacyPolicyTermsOfUseWrapper">
            <div className="privacyPolicy">PRIVACY POLICY      •      TERMS OF USE      •      SITEMAP      •      DO NOT SELL MY INFORMATION      •      COOKIES</div>
          </div>
          <div className="apollonianLlcWrapper">
            <div className="apollonianLlc">©   APOLLONIAN, LLC</div>
          </div>
          <div className="extraInfoItem" />
        </div>
        <div className="groupParent">
          <div className="rectangleWrapper">
            <div className="groupChild" />
          </div>
          <img className="aboutUsIcon" alt="" src="/ABOUT US.png" />
          <div className="atPtvWeContainer">
            <p>
              <span className="at">At</span>
              <span className="ptv"> PTV</span>
              <span>, we exist to illuminate beauty—crafted by nature, perfected by artistry. Each gemstone tells a story of timeless elegance, authenticity, and grace.</span>
            </p>
            <p> </p>
            <p>More than just jewelry, our creations are symbols of refinement, luck, and individuality, designed for those who seek meaning in every detail.</p>
            <p> </p>
            <p>Because true brilliance is meant to be worn.</p>
          </div>
          <b className="whatWereWeContainer">
            <p> </p>
            <p>What were we made for?</p>
          </b>
          <div className="aboutUs1">
            <div className="aboutUs2">ABOUT US</div>
          </div>
        </div>
        <div className="features9">
          <div className="bg" />
          <div className="list">
            <div className="div">
              <b className="qunLSn">Quản lý sản phẩm</b>
              <div className="hTrThm">Hỗ trợ thêm, chỉnh sửa, lọc, sắp xếp, phân loại và theo dõi số lượng sản phẩm – từ trang sức đơn lẻ đến bộ sưu tập.</div>
              <img className="archiveContent1Icon" alt="" src="/archive-content 1.svg" />
            </div>
            <div className="div1">
              <b className="boCoDoanh">Báo cáo doanh thu & hiệu quả bán hàng</b>
              <div className="theoDiTnh">Theo dõi tình hình bán hàng theo thời gian, phân tích xu hướng tiêu dùng và hiệu suất hoạt động thông qua biểu đồ tăng trưởng.</div>
              <img className="chartBar331Icon" alt="" src="/chart-bar-33 1.svg" />
            </div>
            <div className="div2">
              <b className="qunLD">Quản lý dữ liệu người dùng & tài khoản</b>
              <div className="luTrV">Lưu trữ và xử lý thông tin khách hàng, nhân viên, nhà cung cấp và tài khoản truy cập một cách bảo mật và có tổ chức.</div>
              <img className="board21Icon" alt="" src="/board-2 1.svg" />
            </div>
            <div className="div3">
              <b className="biuDinD">Biểu diễn dữ liệu trực quan</b>
              <div className="hinThCc">Hiển thị các chỉ số kinh doanh bằng biểu đồ hình tròn, cột hoặc đường, giúp việc theo dõi và phân tích trở nên trực quan và sinh động.</div>
              <img className="chart31Icon" alt="" src="/chart-3 1.svg" />
            </div>
            <div className="div4">
              <b className="linKtD">Liên kết dữ liệu & logic hệ thống</b>
              <div className="mBoTnh">Đảm bảo tính đồng bộ giữa các bảng dữ liệu như đơn hàng, khách hàng, sản phẩm và kho hàng thông qua các ràng buộc logic chặt chẽ.</div>
              <img className="commandIcon" alt="" src="/command.svg" />
            </div>
            <div className="div5">
              <b className="thngK">Thống kê & hỗ trợ quản lý</b>
              <div className="cungCpTng">Cung cấp tổng quan hoạt động kinh doanh qua các chỉ số thống kê, giúp người quản trị theo dõi và ra quyết định nhanh chóng.</div>
              <img className="barChart2Icon" alt="" src="/bar-chart-2.svg" />
            </div>
            {/* <img className="linesIcon" alt="" src="/Lines.svg" /> */}
          </div>
          <div className="content">
            <b className="systemOverview">System Overview</b>
          </div>
        </div>
        <img className="logovtp1Icon" alt="" src="/logoVTP.svg" />
        <div className="logoParent">
          <div className="logo">
            <b className="ptvJewelry">
              <span>/</span>
              <span className="ptvJewelry1">PTV JEWELRY</span>
            </b>
          </div>
          <div className="menu">
            <div className="tngQuan">Tổng Quan</div>
            <div className="chiTit">Chi Tiết</div>
            <div className="hTr">Hỗ Trợ</div>
          </div>
          <div className="shopGiftsButton" onClick={handleLoginClick}>
            <div className="shopGifts">Đăng Nhập</div>
          </div>
        </div>
        <div className="rectangleParent">
          <img className="groupItem" alt="" src="/HeadIntro.png" />
          <div className="theAutumnEquinox">the autumn equinox</div>
          <div className="fallHasArrivedContainer">
            <span className="fallHasArrivedContainer1">
              <p>Fall has arrived.</p>
              <p>Shop for our new releases starting today.</p>
            </span>
          </div>
          <div className="aboutUs3">
            <div className="aboutUs2">START NOW</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPage;