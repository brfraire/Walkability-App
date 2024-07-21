import React from 'react'

const Instructions = ({step, no_}) => {
    return (
        <div>
            <article className="flex justify-start items-center gap-2">
                <div>{no_}</div>
                <p className="text-white font-semibold text-sm">{step}</p>

            </article>

        </div>
    );
};

export default Instructions;