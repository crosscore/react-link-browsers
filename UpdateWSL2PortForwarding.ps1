# get WSL2 IP address
$wslIp = bash.exe -c "ip addr show eth0 | grep 'inet\b' | awk '{print $2}' | cut -d/ -f1"

# delete all port forwarding rules
netsh interface portproxy reset

# add port forwarding rules
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=3000 connectaddress=$wslIp connectport=3000
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=8080 connectaddress=$wslIp connectport=8080

# netsh interface portproxy show all