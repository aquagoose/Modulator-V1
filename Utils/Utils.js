module.exports = 
    {
        inCollector: [],
        
        generateColor()
        {
            let color = "";
            for (let i = 0; i < 3; i++)
            {
                const chars = "0123456789ABCDEF";
                const char = chars[Math.floor(Math.random() * chars.length)];
                color += `${char}${char}`;
            }
            if (color === "FF0000" || color === "00FF00") this.generateColor();
            else return color;
        },
        
        isInMessageCollector(member)
        {
            return this.inCollector.indexOf(member.id) > -1;
        },
        
        setInMessageCollector(member)
        {
            this.inCollector.push(member.id);
        },
        
        removeFromMessageCollector(member)
        {
            this.inCollector.splice(this.inCollector.indexOf(member), 1);
        }
    }