import PhotosUploader from "../PhotosUploader.jsx";
import Perks from "../Perks.jsx";
import {useState,useEffect} from "react";
import {Navigate,useParams} from "react-router-dom";
import AccountNav from "../AccountNav.jsx";
import axios from "axios";
export default function PlacesFormPage(){
    const {id}=useParams();
    console.log(id);


        const [title,setTitle]=useState('');
        const[address,setAddress]=useState('');
        const[addedPhotos,setAddedPhotos]=useState([]);

        const[description,setDescription]=useState('');
        const[perks,setPerks]=useState([]);
        const[extraInfo,setExtraInfo]=useState('');
        const[checkIn,setCheckIn]=useState('');
        const[checkOut,setCheckOut]=useState('');
        const[maxGuests,setMaxGuests]=useState(1);
        const[price,setPrice]=useState('');
        const[redirect,setRedirect]=useState('');
        useEffect(() => {
            if(!id){
                return;
                }
            axios.get('/places/'+id).then(response => {
                const{data}=response;
                setTitle(data.title);
                setAddress(data.address);
                setAddedPhotos(data.photos);
                setDescription(data.description);
                setPerks(data.perks);
                setExtraInfo(data.extraInfo);
                setCheckIn(data.checkIn);
                setCheckOut(data.checkOut);
                setMaxGuests(data.maxGuests);
                setPrice(data.price);
                });
            },[id]);


            function inputHeader(text){
                return(
                    <h2 className="text-2xl mt-4">{text}</h2>
                    )}
            function InputDescription(text){
                return(
                    <p className="text-gray-500 text-sm">{text}</p>)}
            function preInput(header,description){
                return(

                    <>
                    {inputHeader(header)}
                    {InputDescription(description)}
                    </>

                    )}

            async function savePlace(ev){
                ev.preventDefault();
                const placeData={

                    title,address,addedPhotos,
                    description,perks,extraInfo,
                    checkIn,checkOut,maxGuests,price
                    };
              if(id){
                  await axios.put('/places',{
                      id, ...placeData
                      });
                      setRedirect('/account/places');
                  }
                  else{
                      await axios.post('/places',placeData);
                      setRedirect('/account/places');
                      }
                  }



            if(redirect){
                return <Navigate to={redirect}/>
                }



    return(

                     <div>
                     <AccountNav/>
                     <form onSubmit={savePlace}>
                         {preInput("Title","Title of your place should be should be short and catchy as in advertisement")}


                         <input type="text"
                         value={title}
                         onChange={ev => setTitle(ev.target.value)}
                         placeholder="title,for example: My Lovely Apartment"/>
                         {preInput("Address","Address to this place")}

                         <input type="text"
                          value={address}
                          onChange={ev=>setAddress(ev.target.value)}
                          placeholder="address"/>
                         {preInput("Photos","more=better")}

                         <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos}/>
                           {preInput("Description","description of the place")}

                          <textarea value={description} onChange={ev => setDescription(ev.target.value)}/>
                          {preInput("Perks","select all the perks of the place")}

                           <div className=" mt-2 grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                              <Perks selected={perks} onChange={setPerks}/>
                               </div>
                               {preInput("Extra Info","house,rules etc...")}


                               <textarea value={extraInfo} onChange={ev => setExtraInfo(ev.target.value)}/>
                               {preInput("Check in&out times","add check-in & out times,remember to have some time window for cleaning the room between guests")}

                               <div className="grid gap-2 sm:grid-cols-3">
                                <div>
                                    <h3 className="mt-2 -mb-1">Check in time</h3>
                                    <input type="text"
                                    value={checkIn}
                                    onChange={ev => setCheckIn(ev.target.value)}
                                    placeholder="14"/>
                                </div>
                                <div>
                                    <h3 className="mt-2 -mb-1">Check out time</h3>
                                    <input type="text"
                                    value={checkOut}
                                    onChange={ev => setCheckOut(ev.target.value)}/>
                                </div>
                                <div>
                                    <h3 className="mt-2 -mb-1 grow-1">Max no of guests</h3>
                                    <input type="number" value={maxGuests}
                                    onChange={ev => setMaxGuests(ev.target.value)}
                                    />
                                </div>
                                <div>
                                     <h3 className="mt-2 -mb-1">Price per night</h3>
                                     <input type="number" value={price}
                                      onChange={ev => setPrice(ev.target.value)}/>
                                </div>
                                 </div>
                                <button className="primary my-4">Save</button>


                     </form>
                     </div>
        )
    ;
    }