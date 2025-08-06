import React from 'react'

const CustomInput = (props) => {
    const {type,name,placeholder,val,classname,onCh} = props
    return (
      
      <div>
          <input type={type} placeholder={placeholder} className={`w-full p-3 text-xl outline-none border rounded-xl px-5 mt-5 ${classname}`} name={name} value={val} onChange={onCh} onBlur={onCh} />
      </div>
    )
}

export default CustomInput;