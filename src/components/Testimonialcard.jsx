import React from 'react'

const Testimonialcard = (props) => {
    return (
        <div className="border m-2  min-w-120 min-h-[100px] rounded-l-full rounded-r-full flex flex-row items-center justify-start gap-4 pl-4 outline-2 outline-offset-2 outline-cyan-500 border-cyan-500 ">
            <div className='  rounded-full w-15 h-15'><img src={props.image} className='h-15 w-15 object-contain rounded-full' alt="" /></div>
            <div className='w-90 h-18   text-center flex flex-col justify-center items-center'>
                <div className='font-semibold bg dark:text-white text-black'>{props.review}</div>
                <div className='text-right text-[11px] font-semibold  w-full text-cyan-500'>-{props.author}</div>
            </div>
        </div>
    )
}

export default Testimonialcard
