import React from "react";
import { FaBuildingCircleCheck } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa6";
import { FaChartLine } from "react-icons/fa6";
import { MdArticle } from "react-icons/md";
import { AiFillFilePdf } from "react-icons/ai";
import { TbCoinEuroFilled } from "react-icons/tb";
import "./index.css"; // Optional CSS for styling

const servicesData = [
  {
    icon: <FaBuildingCircleCheck className="icon" />,
    title: "Company Registration",
    description:
      "The initial step in launching your venture is setting up the business. Should your idea be structured as a limited liability company or a sole proprietorship? Let us handle the details we've expertly managed for years.",
  },
  {
    icon: <FaUsers className="icon" />,
    title: "Business Consultation",
    description:
      "We provide tailored business development guidance based on individual client assessments, enabling us to focus on the areas that need the most attention. Our goal is to help clients achieve their objectives efficiently by offering support across multiple aspects of their business.",
  },
  {
    icon: <MdArticle className="icon" />,
    title: "Accounting & VAT Services",
    description:
      "We offer complete accounting and VAT solutions tailored to your financial requirements. Our skilled team ensures your financial records are precise, current, and in full compliance with legal regulations. VAT services are always included as part of our offering.",
  },

  {
    icon: <AiFillFilePdf className="icon" />,
    title: "Invoicing Solutions",
    description:
      "Our advanced invoicing services offer a variety of options for efficiently billing your clients. Experience the ease of our email and digital invoicing solutions designed for seamless transactions.",
  },
  {
    icon: <TbCoinEuroFilled className="icon" />,
    title: "Payroll Management",
    description:
      "We are dedicated to helping our clients accurately compensate their employees. With a team of seasoned professionals, we provide precise salary calculations and complete vacation benefit management, ensuring that all employees are fairly and timely rewarded for their contributions.",
  },
  {
    icon: <FaChartLine className="icon" />,
    title: "Financial Reporting",
    description:
      "Our team of skilled financial professionals is committed to delivering precise and detailed financial statements, ensuring an accurate reflection of your annual balance sheet and overall financial health.",
  },
];

const MyServices = () => {
  return (
    <div id="services" className="services">
      <h2>Our Services</h2>
      <p>
        We provide a full range of accounting services tailored to meet your
        needs.
      </p>
      <div className="services-list">
        {servicesData.map((service, index) => (
          <div className="service-card" key={index}>
            {service.icon}
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyServices;
