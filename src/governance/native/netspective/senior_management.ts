export interface Props {
  readonly name: string;
  readonly designation: string;
  readonly image: string;
}

export type seniorManagement = Props;

export const seniorManagement: Props[] = [
  {
    name: "Gunjan Siroya",
    designation: "Sr. VP and Principal Partner",
    image: "/assets-natural/brand/www.netspective.com/team/Gunjan-Siroya-2.jpg",
   
  },
  {
    name: "Sarji R Mohammedali",
    designation: "Director of Engineering",
    image: "/assets-natural/brand/www.netspective.com/team/Sarji-R-Mohammedali.jpg",
   },
  {
    name: "Don Lee",
    designation: "Director of Integration",
    image: "/assets-natural/brand/www.netspective.com/team/Don-Lee.jpg",
  }
];
