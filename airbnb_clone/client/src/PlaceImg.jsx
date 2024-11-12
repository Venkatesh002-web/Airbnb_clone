import Image from "./Image.jsx";

export default function PlaceImg({place,index=0,className=null}) {
  if (!place.photos?.length) {
    return '';
  }
  if (!className) {
    className = 'object-cover rounded-2xl';
  }
  return (
    <Image className={className} src={place.photos[index]} alt=""/>
  );
}